from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime, timedelta
from .models import CommunityPost, Comment, Announcement , IncidentReport
from accounts.models import User

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def community_posts(request):
    try:
        user = request.user  # ✅ this is the correct way
        user_id = str(user.id)
        
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            category = request.GET.get('category')
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 20))
            skip = (page - 1) * limit
            
            # Build query
            query = {'is_active': True}
            if category:
                query['category'] = category
            
            # Get posts
            posts = CommunityPost.objects(**query).order_by('-is_pinned', '-created_at').skip(skip).limit(limit)
            
            posts_data = []
            for post in posts:
                post_dict = post.to_dict()
                post_dict['is_liked'] = user_id in post.likes
                
                # Get comments count
                comments_count = Comment.objects(post_id=str(post.id), is_active=True).count()
                post_dict['comments_count'] = comments_count
                
                posts_data.append(post_dict)
            
            return Response({
                'posts': posts_data,
                'page': page,
                'has_more': len(posts_data) == limit
            })
        
        elif request.method == 'POST':
            content = request.data.get('content')
            category = request.data.get('category', 'discussion')
            title = request.data.get('title', '')
            
            if not content:
                return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            post = CommunityPost(
                user_id=user_id,
                user_name=user.name,
                user_role=user.role,
                title=title,
                content=content,
                category=category
            )

            post.save()
            
            return Response({
                'message': 'Post created successfully',
                'post': post.to_dict()
            }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    try:
        user_id = str(request.user.id)  # ✅ or: user = request.user

        
        post = CommunityPost.objects(id=post_id, is_active=True).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if user_id in post.likes:
            # Unlike
            post.likes.remove(user_id)
            liked = False
        else:
            # Like
            post.likes.append(user_id)
            liked = True
        
        post.save()
        
        return Response({
            'liked': liked,
            'likes_count': len(post.likes)
        })
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def post_comments(request, post_id):
    try:
        user = request.user  # ✅ this is the correct way
        user_id = str(user.id)
        
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verify post exists
        post = CommunityPost.objects(id=post_id, is_active=True).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 20))
            skip = (page - 1) * limit
            
            comments = Comment.objects(
                post_id=post_id, 
                is_active=True
            ).order_by('-created_at').skip(skip).limit(limit)
            
            comments_data = []
            for comment in comments:
                comment_dict = comment.to_dict()
                comment_dict['is_liked'] = user_id in comment.likes
                comments_data.append(comment_dict)
            
            return Response({
                'comments': comments_data,
                'page': page,
                'has_more': len(comments_data) == limit
            })
        
        elif request.method == 'POST':
            content = request.data.get('content')
            
            if not content:
                return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            comment = Comment(
                post_id=post_id,
                user_id=user_id,
                user_name=user.name,
                user_role=user.role,
                content=content
            )
            comment.save()
            
            return Response({
                'message': 'Comment created successfully',
                'comment': comment.to_dict()
            }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def announcements(request):
    try:
        user = request.user  # ✅ this is the correct way
        user_id = str(user.id)
        
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            # Get announcements for user's role
            announcements = Announcement.objects(
                is_active=True,
                target_roles__in=[user.role, 'all']
            ).order_by('-priority', '-created_at')
            
            # Filter out expired announcements
            active_announcements = []
            for announcement in announcements:
                if not announcement.expires_at or announcement.expires_at > datetime.utcnow():
                    active_announcements.append(announcement.to_dict())
            
            return Response({'announcements': active_announcements})
        
        elif request.method == 'POST':
            # Only admins can create announcements
            if user.role != 'admin':
                return Response({'error': 'Only admins can create announcements'}, status=status.HTTP_403_FORBIDDEN)
            
            title = request.data.get('title')
            content = request.data.get('content')
            priority = request.data.get('priority', 'medium')
            target_roles = request.data.get('target_roles', ['user', 'volunteer'])
            expires_at = request.data.get('expires_at')
            
            if not title or not content:
                return Response({'error': 'Title and content are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            announcement = Announcement(
                title=title,
                content=content,
                author_id=user_id,
                author_name=user.name,
                priority=priority,
                target_roles=target_roles
            )
            
            if expires_at:
                announcement.expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            
            announcement.save()
            
            return Response({
                'message': 'Announcement created successfully',
                'announcement': announcement.to_dict()
            }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def community_stats(request):
    try:
        user = request.user  # ✅ this is the correct way
        user_id = str(user.id)
        
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        stats = {
            'total_members': User.objects(is_active=True).count(),
            'total_posts': CommunityPost.objects(is_active=True).count(),
            'posts_this_week': CommunityPost.objects(
                is_active=True,
                created_at__gte=datetime.utcnow() - timedelta(days=7)
            ).count(),
            'active_volunteers': User.objects(role='volunteer', is_verified=True, is_active=True).count(),
        }
        
        return Response(stats)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Incident Reporting Endpoints
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def incident_reports(request):
    user = request.user
    if request.method == "GET":
        reports = IncidentReport.objects()
        return Response([report.to_mongo().to_dict() for report in reports])
    elif request.method == "POST":
        data = request.data
        report = IncidentReport(
            incident_type=data.get('incident_type'),
            severity=data.get('severity', 'low'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            address=data.get('address'),
            description=data.get('description'),
            status='pending',
            user_id=str(user.id),
            is_anonymous=data.get('is_anonymous', False)
        )
        report.save()
        return Response(report.to_mongo().to_dict(), status=201)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_report_status(request, report_id):
    status = request.data.get('status')
    report = IncidentReport.objects(id=report_id).first()
    if not report:
        return Response({"error": "Not found"}, status=404)
    report.status = status
    report.save()
    return Response(report.to_mongo().to_dict())
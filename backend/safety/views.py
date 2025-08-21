from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from datetime import datetime, timedelta
import time
import json
from .models import SOSAlert, IncidentReport, SafeZone, RiskZone
from accounts.models import User
from django.conf import settings

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_sos_alert(request):
    try:
        user_id = user = request.user
        user_id = str(user.id)  # or user.pk

        user = User.objects(id=user_id).first()
        
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user has an active SOS alert
        active_alert = SOSAlert.objects(user_id=user_id, status='active').first()
        if active_alert:
            return Response({'error': 'You already have an active SOS alert'}, status=status.HTTP_400_BAD_REQUEST)
        
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        message = request.data.get('message', '')
        
        if not latitude or not longitude:
            return Response({'error': 'Location coordinates required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create SOS alert
        sos_alert = SOSAlert(
            user_id=user_id,
            user_name=user.name,
            latitude=float(latitude),
            longitude=float(longitude),
            address=request.data.get('address', ''),
            message=message,
            priority='high'
        )
        sos_alert.save()
        
        # Update user location
        user.current_latitude = float(latitude)
        user.current_longitude = float(longitude)
        user.last_location_update = datetime.utcnow()
        user.save()
        
        return Response({
            'message': 'SOS alert created successfully',
            'alert': sos_alert.to_dict()
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def long_poll_sos_alerts(request):
    try:
        user = request.user  # Now this is your MongoEngine User instance
        user_id = str(user.id)
        
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.role not in ['volunteer', 'admin']:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        last_check = request.GET.get('last_check')
        if last_check:
            last_check = datetime.fromisoformat(last_check.replace('Z', '+00:00'))
        else:
            last_check = datetime.utcnow() - timedelta(minutes=5)

        timeout = getattr(settings, 'LONG_POLL_TIMEOUT', 10)  # Add defaults
        check_interval = getattr(settings, 'LONG_POLL_CHECK_INTERVAL', 2)
        start_time = time.time()

        while time.time() - start_time < timeout:
            alerts = SOSAlert.objects(
                updated_at__gte=last_check,
                status__in=['active', 'responded']
            ).order_by('-created_at')

            if alerts:
                alerts_data = [alert.to_dict() for alert in alerts]
                return Response({
                    'alerts': alerts_data,
                    'timestamp': datetime.utcnow().isoformat()
                })

            time.sleep(check_interval)

        return Response({
            'alerts': [],
            'timestamp': datetime.utcnow().isoformat()
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_sos(request, alert_id):
    try:
        user_id = user = request.user
        user_id = str(user.id)  # or user.pk

        user = User.objects(id=user_id).first()
        
        if not user or user.role != 'volunteer':
            return Response({'error': 'Only volunteers can respond to SOS alerts'}, status=status.HTTP_403_FORBIDDEN)
        
        alert = SOSAlert.objects(id=alert_id).first()
        if not alert:
            return Response({'error': 'SOS alert not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if alert.status != 'active':
            return Response({'error': 'SOS alert is no longer active'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add volunteer to responders list
        if user_id not in alert.responders:
            alert.responders.append(user_id)
            alert.status = 'responded'
            alert.save()
        
        return Response({
            'message': 'Response recorded successfully',
            'alert': alert.to_dict()
        })
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resolve_sos_alert(request, alert_id):
    try:
        user_id = user = request.user
        user_id = str(user.id)  # or user.pk

        user = User.objects(id=user_id).first()
        
        alert = SOSAlert.objects(id=alert_id).first()
        if not alert:
            return Response({'error': 'SOS alert not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Only the alert creator or volunteers can resolve
        if alert.user_id != user_id and user.role not in ['volunteer', 'admin']:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        alert.status = 'resolved'
        alert.resolved_at = datetime.utcnow()
        alert.save()
        
        return Response({
            'message': 'SOS alert resolved successfully',
            'alert': alert.to_dict()
        })
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_incident_report(request):
    try:
        user_id = user = request.user
        user_id = str(user.id)  # or user.pk

        is_anonymous = request.data.get('is_anonymous', False)
        
        required_fields = ['incident_type', 'severity', 'latitude', 'longitude', 'description', 'incident_time']
        for field in required_fields:
            if not request.data.get(field):
                return Response({'error': f'{field} is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        incident_report = IncidentReport(
            user_id=None if is_anonymous else user_id,
            incident_type=request.data['incident_type'],
            severity=request.data['severity'],
            latitude=float(request.data['latitude']),
            longitude=float(request.data['longitude']),
            address=request.data.get('address', ''),
            description=request.data['description'],
            incident_time=datetime.fromisoformat(request.data['incident_time'].replace('Z', '+00:00')),
            is_anonymous=is_anonymous
        )
        incident_report.save()
        
        return Response({
            'message': 'Incident report created successfully',
            'report': incident_report.to_dict()
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# List all incident reports
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_incident_reports(request):
    try:
        # Simple list all active incident reports sorted by creation date descending
        reports = IncidentReport.objects.order_by('-created_at')
        reports_list = [r.to_dict() for r in reports]
        return Response(reports_list)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_map_data(request):
    print("DEBUG: request.user =", request.user)
    try:
        user_id = str(request.user.id)
        print("DEBUG: user_id =", user_id)
        user = User.objects(id=user_id).first()
        print("DEBUG: found user =", user)
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        data = {}
        
        # Safe zones (visible to all)
        safe_zones = SafeZone.objects(is_active=True)
        data['safe_zones'] = [zone.to_dict() for zone in safe_zones]
        
        # Risk zones (visible to all)
        risk_zones = RiskZone.objects(is_active=True)
        data['risk_zones'] = [zone.to_dict() for zone in risk_zones]
        
        # SOS alerts (visible to volunteers and admins)
        if user.role in ['volunteer', 'admin']:
            sos_alerts = SOSAlert.objects(status__in=['active', 'responded']).order_by('-created_at')
            data['sos_alerts'] = [alert.to_dict() for alert in sos_alerts]
        
        # Nearby volunteers (visible to users and admins)
        if user.role in ['user', 'admin']:
            volunteers = User.objects(
                role='volunteer',
                is_verified=True,
                is_active=True,
                current_latitude__exists=True,
                current_longitude__exists=True
            )
            data['volunteers'] = [
                {
                    'id': str(vol.id),
                    'name': vol.name,
                    'latitude': vol.current_latitude,
                    'longitude': vol.current_longitude,
                    'last_update': vol.last_location_update.isoformat() if vol.last_location_update else None
                }
                for vol in volunteers
            ]
        
        return Response(data)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_safety_stats(request):
    try:
        user_id = user = request.user
        user_id = str(user.id)  # or user.pk

        user = User.objects(id=user_id).first()
        
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        stats = {}
        
        # Basic stats for all users
        stats['safe_zones_count'] = SafeZone.objects(is_active=True).count()
        stats['active_volunteers'] = User.objects(role='volunteer', is_verified=True, is_active=True).count()
        
        # Role-specific stats
        if user.role == 'user':
            stats['user_alerts'] = SOSAlert.objects(user_id=user_id).count()
            stats['user_reports'] = IncidentReport.objects(user_id=user_id).count()
        
        elif user.role == 'volunteer':
            stats['active_alerts'] = SOSAlert.objects(status='active').count()
            stats['responded_alerts'] = SOSAlert.objects(responders=user_id).count()
        
        elif user.role == 'admin':
            stats['total_users'] = User.objects(is_active=True).count()
            stats['total_alerts'] = SOSAlert.objects().count()
            stats['total_reports'] = IncidentReport.objects().count()
            stats['pending_volunteers'] = User.objects(role='volunteer', is_verified=False).count()
        
        return Response(stats)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sos_alerts(request):
    try:
        user_id = user = request.user
        user_id = str(user.id)  # or user.pk

        user = User.objects(id=user_id).first()

        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Allow volunteers and admins to see alerts
        if user.role in ['volunteer', 'admin']:
            alerts = SOSAlert.objects(status__in=['active', 'responded']).order_by('-created_at')
        else:
            # Users can only see their own alerts
            alerts = SOSAlert.objects(user_id=user_id).order_by('-created_at')

        alert_list = [alert.to_dict() for alert in alerts]
        return Response({'alerts': alert_list}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

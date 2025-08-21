from mongoengine import Document, StringField, DateTimeField, BooleanField, IntField, ListField,FloatField
from datetime import datetime

class CommunityPost(Document):
    CATEGORY_CHOICES = [
        ('safety_tip', 'Safety Tip'),
        ('question', 'Question'),
        ('update', 'Update'),
        ('announcement', 'Announcement'),
        ('discussion', 'Discussion'),
    ]
    
    user_id = StringField(required=True)
    user_name = StringField(required=True)
    user_role = StringField(required=True)
    title = StringField(max_length=200)
    content = StringField(required=True)
    category = StringField(choices=CATEGORY_CHOICES, default='discussion')
    likes = ListField(StringField())  # List of user IDs who liked
    is_pinned = BooleanField(default=False)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'community_posts',
        'indexes': ['user_id', 'category', 'is_pinned', 'created_at']
    }
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': self.user_id,
            'user_name': self.user_name,
            'user_role': self.user_role,
            'title': self.title,
            'content': self.content,
            'category': self.category,
            'likes_count': len(self.likes),
            'is_liked': False,  # Will be set in view based on current user
            'is_pinned': self.is_pinned,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class Comment(Document):
    post_id = StringField(required=True)
    user_id = StringField(required=True)
    user_name = StringField(required=True)
    user_role = StringField(required=True)
    content = StringField(required=True)
    likes = ListField(StringField())  # List of user IDs who liked
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'comments',
        'indexes': ['post_id', 'user_id', 'created_at']
    }
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'post_id': self.post_id,
            'user_id': self.user_id,
            'user_name': self.user_name,
            'user_role': self.user_role,
            'content': self.content,
            'likes_count': len(self.likes),
            'is_liked': False,  # Will be set in view based on current user
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class Announcement(Document):
    title = StringField(required=True, max_length=200)
    content = StringField(required=True)
    author_id = StringField(required=True)
    author_name = StringField(required=True)
    priority = StringField(choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ], default='medium')
    target_roles = ListField(StringField())  # ['user', 'volunteer', 'admin']
    is_active = BooleanField(default=True)
    expires_at = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'announcements',
        'indexes': ['priority', 'target_roles', 'is_active', 'created_at']
    }
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'content': self.content,
            'author_id': self.author_id,
            'author_name': self.author_name,
            'priority': self.priority,
            'target_roles': self.target_roles,
            'is_active': self.is_active,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class IncidentReport(Document):
    incident_type = StringField(required=True)
    severity = StringField(choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")], default="low")
    latitude = FloatField(required=True)
    longitude = FloatField(required=True)
    address = StringField(required=True)
    description = StringField(required=True)
    status = StringField(choices=[("pending", "Pending"), ("investigating", "Investigating"), ("resolved", "Resolved")], default="pending")
    user_id = StringField()
    is_anonymous = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'incident_reports',
        'indexes': [
            'incident_type', 'status', 'created_at'
        ]
    }
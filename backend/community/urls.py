from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.community_posts, name='community_posts'),
    path('posts/<str:post_id>/like/', views.like_post, name='like_post'),
    path('posts/<str:post_id>/comments/', views.post_comments, name='post_comments'),
    path('announcements/', views.announcements, name='announcements'),
    path('stats/', views.community_stats, name='community_stats'),
    path('incidents/', views.incident_reports, name='incident_reports'),
    path('incidents/<report_id>/status/', views.update_report_status, name='update_report_status'),

]

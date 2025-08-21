from django.urls import path
from . import views

urlpatterns = [
    path('sos-alerts/', views.create_sos_alert, name='create_sos_alert'),
    path('sos-alerts/list/', views.list_sos_alerts, name='list_sos_alerts'),
    path('sos/long-poll/', views.long_poll_sos_alerts, name='long_poll_sos_alerts'),
    path('sos/<str:alert_id>/respond/', views.respond_to_sos, name='respond_to_sos'),
    path('sos/<str:alert_id>/resolve/', views.resolve_sos_alert, name='resolve_sos_alert'),
    path('reports/create/', views.create_incident_report, name='create_incident_report'),
    path('reports/', views.list_incident_reports, name='list_incident_reports'),
    path('map-data/', views.get_map_data, name='get_map_data'),
    path('stats/', views.get_safety_stats, name='get_safety_stats'),
]

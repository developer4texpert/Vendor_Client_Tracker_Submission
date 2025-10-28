from django.urls import path
from . import views

urlpatterns = [
    # Marketer APIs
    path('AddMarketer/', views.AddMarketer, name='add-marketer'),
    path('GetMarketer/', views.GetMarketerInfo, name='get-marketer'),

    # Recruiter APIs
    path('AddRecruiter/', views.AddRecruiter, name='add-recruiter'),
    path('GetRecruiter/', views.GetRecruiterInfo, name='get-recruiter'),
]

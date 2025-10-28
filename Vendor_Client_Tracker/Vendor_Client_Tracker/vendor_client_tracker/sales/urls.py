from django.urls import path
from . import views

urlpatterns = [
    path('AddSkill/', views.add_skill, name='add_skill'),
    path('GetSkill/', views.get_skills, name='get_skills'),
    path('AddVisa/', views.add_visa, name='add_visa'),
    path('GetVisa/', views.get_visas, name='get_visas'),
    path('AddConsultant/', views.add_consultant, name='add_consultant'),
    path('GetAllConsultants/', views.get_all_consultants, name='get_all_consultants'),
    path('GetConsultantByID/', views.get_consultant_by_id, name='get_consultant_by_id'),
    path('UpdateConsultant/', views.update_consultant, name='update_consultant'),
    path('UpdateConsultantStatus/', views.update_consultant_status, name='update_consultant_status'),
    path('AddSubmission/', views.add_submission, name='add_submission'),
    path('UpdateSubmission/', views.update_submission, name='update_submission'),
    path('GetAllSubmissions/', views.get_all_submissions, name='get_all_submissions'),
    path('GetSubmissionByID/', views.get_submission_by_id, name='get_submission_by_id'),
    path('GetSubmissionByVendor/', views.get_submissions_by_vendor, name='get_submissions_by_vendor'),
    path('GetSubmissionByClient/', views.get_submissions_by_client, name='get_submissions_by_client'),
    path('GetSubmissionByMarketer/', views.get_submissions_by_marketer, name='get_submissions_by_marketer'),
    path('GetSubmissionByConsultant/', views.get_submissions_by_consultant, name='get_submissions_by_consultant'),
    path('UpdateVendorResponse/', views.update_vendor_response, name='update_vendor_response'),
    path('GetSubmissionReport/', views.submission_report, name='get_submission_report'),

    
    
]

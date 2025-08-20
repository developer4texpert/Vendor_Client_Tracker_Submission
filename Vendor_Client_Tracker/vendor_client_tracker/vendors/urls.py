from django.urls import path
from . import views

urlpatterns = [
    path('AddVendor/', views.add_vendor, name='add_vendor'),
    path('GetVendor/', views.get_vendors, name='get_vendors'),  # list
    path('GetVendorByID/<int:vendor_id>/', views.get_vendor_by_id, name='get_vendor_by_id'),  # single vendor
    path('UpdateVendor/<int:vendor_id>/', views.update_vendor, name='update_vendor'),  # update vendor
    path('DeleteVendor/<int:vendor_id>/', views.delete_vendor, name='delete_vendor'),  # delete vendor
    path('AddVendorContact/<int:vendor_id>/', views.add_vendor_contact, name='add_vendor_contact'),
    path('GetVendorContacts/<int:vendor_id>/', views.get_vendor_contacts, name='get_vendor_contacts'),
]

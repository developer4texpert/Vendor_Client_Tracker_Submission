# clients/urls.py
from django.urls import path
from .views import DomainListAPI, AddClientAddressView, GetClientAddressesView, UpdateClientAddressView, DeleteClientAddressView
from . import views

urlpatterns = [
    path("domains/", DomainListAPI.as_view(), name="domain-list"),
    path('AddClient/', views.AddClientView.as_view(), name='add-client'),
    path('GetClient/', views.GetClientView.as_view(), name='get-client'),
    path('GetClientByID/<int:pk>/', views.GetClientByIDView.as_view(), name='get-client-by-id'),
    path('UpdateClient/<int:pk>/', views.UpdateClientView.as_view(), name='update-client'),
    path('DeleteClient/<int:pk>/', views.DeleteClientView.as_view(), name='delete-client'),
    path('SearchClient/', views.SearchClientView.as_view(), name='searchclient'),
    path('AttachVendor/<int:client_id>/', views.AttachVendorToClientView.as_view(), name='attach-vendor'),
    path('GetVendorsForClient/<int:client_id>/', views.GetVendorsForClientView.as_view(), name='get-vendors-for-client'),
    path('DetachVendorFromClient/<int:client_id>/<int:vendor_id>/', views.DetachVendorFromClientView.as_view(), name='detach-vendor-from-client'),
    path('ClientStats/', views.ClientStatisticsView.as_view(), name='clientstats'),
    path("AddClientAddress/", AddClientAddressView.as_view(), name="add-client-address"),
    path("GetClientAddresses/", GetClientAddressesView.as_view(), name="get-client-addresses"),
    path("UpdateClientAddress/", UpdateClientAddressView.as_view(), name="update-client-address"),
    path("DeleteClientAddress/", DeleteClientAddressView.as_view(), name="delete-client-address"),
    path('SearchClient/', views.SearchClientView.as_view(), name='searchclient'),
    # Optional sanity endpoint:
    # path('GetVendor/', views.GetVendorView.as_view(), name='get-vendor'),
]

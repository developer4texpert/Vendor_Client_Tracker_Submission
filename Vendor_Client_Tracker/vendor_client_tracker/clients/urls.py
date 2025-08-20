from django.urls import path
from .views import (AddClientView, GetClientView, GetClientByIDView, 
                    UpdateClientView, DeleteClientView, SearchClientView, 
                    AttachVendorToClientView,GetVendorsForClientView, DetachVendorFromClientView,
                    ClientStatisticsView)

urlpatterns = [
    path('AddClient/', AddClientView.as_view(), name='add-client'),
    path('GetClient/', GetClientView.as_view(), name='get-client'),
    path('GetClientByID/<int:pk>/', GetClientByIDView.as_view(), name='get-client-by-id'),
    path('UpdateClient/<int:pk>/', UpdateClientView.as_view(), name='update-client'),
    path('DeleteClient/<int:pk>/', DeleteClientView.as_view(), name='delete-client'),
    path('SearchClient/', SearchClientView.as_view(), name='searchclient'),
    path('AttachVendor/<int:client_id>/', AttachVendorToClientView.as_view(), name='attach-vendor'),
    path('GetVendorsForClient/<int:client_id>/', GetVendorsForClientView.as_view(), name='get-vendors-for-client'),
    path('DetachVendorFromClient/<int:client_id>/<int:vendor_id>/', DetachVendorFromClientView.as_view(), name='detach-vendor-from-client'),
    path('ClientStats/', ClientStatisticsView.as_view(), name='clientstats')
]

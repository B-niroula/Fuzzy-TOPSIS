from django.urls import path
from . import views

urlpatterns = [
    path('receive-data/', views.receive_data, name='receive_data'),
    path('calculate-topsis/', views.calculate_topsis, name='calculate_topsis'),
    path('receive-page2-data/', views.receive_page2_data, name='receive-page2-data'),
    path('delete-expert/', views.delete_expert, name='delete_expert'),
    path('mean-of-experts/', views.mean_of_experts, name='mean_of_experts'),
    path('normalize-decision-matrix/', views.normalize_decision_matrix, name ='normalize_decision_matrix'),
]
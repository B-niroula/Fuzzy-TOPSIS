from django.urls import path
from . import views 

urlpatterns = [ 
    path('', views.index, name = 'index'),
    #path('topsis_result/', views.topsis_result, name='topsis_results'), 
]

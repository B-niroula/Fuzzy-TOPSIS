# Fuzzy-TOPSIS

# Complete installation guide 


Create virtual environment

            $ python3 -m venv venv

Start virtual environment

            $ source venv/bin/activate

Please make sure pip is updated. If not, use 

            $ pip3 install --upgrade pip 

Install all the dependencies

            $ pip3 install django
            $ pip3 install pip install djangorestframework
            $ pip3 install django-cors-headers
            $ pip3 install requests
    
Run the backend as: 
            $ python3 manage.py runserver
            
Run the frontend as:
            $ python3 manage.py runserver 8001
            
            
While using, if the "Calculate-topsis" button doesn't do anything, please check in the terminal running 'backend' if it has "Division by Zero" error. The TOPSIS algorithm includes division operation and if during the fuzzy proces you arrive at zero, the algorithm halts. 




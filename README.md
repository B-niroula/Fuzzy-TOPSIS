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
            cd backend
            $ python3 manage.py runserver
            
Run the frontend as (in a different terminal tab):
            (make sure you are in the same virtual environment (venv))
            cd frontend_input_project
            $ python3 manage.py runserver 8001
            
            
While using, if the "Calculate-topsis" button doesn't do anything, especially if you select the scale 7, please check in the terminal running 'backend' if it has "Division by Zero" error. The TOPSIS algorithm includes division operation and if during the fuzzy proces you arrive at zero, the algorithm halts. For example, in the scale_table for scale value 7, I have l,m,u values as 7: [
        {"l": 0, "m": 0, "u": 1},
        {"l": 0, "m": 1, "u": 3},
        ...
]
Becuase of this zeros, the chances of "Division by Zero" error is high. If you change the l,m,u scale values for every non-zero numbers, this should not be the issue. You can change the scale values at backend/topsis/scale_value.py


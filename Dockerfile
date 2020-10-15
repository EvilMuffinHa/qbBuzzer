FROM python:3.8

ADD . /root/

WORKDIR /root/

RUN pip install -r requirements.txt

WORKDIR /root/

# CMD [ "python", "app.py" ]
CMD [ "gunicorn", "-b", "0.0.0.0:25565","--workers", "3", "--timeout", "86400", "-k", "eventlet", "src.app:app" ]
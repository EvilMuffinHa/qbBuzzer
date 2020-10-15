FROM python:3.8

ADD . /root/

WORKDIR /root/

RUN pip install -r requirements.txt


CMD [ "gunicorn", "-b", "0.0.0.0:25565", "src.app:app" ]
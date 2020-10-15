FROM python:3.8

ADD . /root/

WORKDIR /root

RUN pip install -r requirements.txt

CMD [ "gunicorn", "--chdir", "src", "app:app"]
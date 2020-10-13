from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, BooleanField
from wtforms.validators import DataRequired
class JoinForm(FlaskForm):
	roomcode = StringField('Room Code', validators=[DataRequired()])
	create = SubmitField('Join Room')
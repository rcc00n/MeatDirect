"""Run business regressions offline with synthetic in-memory records."""
import os
from pathlib import Path
import socket
import sys

root = Path(__file__).resolve().parents[1]
os.environ['DJANGO_SETTINGS_MODULE'] = 'shop.settings.test'
os.environ['PYTHON_DOTENV_DISABLED'] = '1'
sys.path.insert(0, str(root / 'backend'))
os.chdir(root / 'backend')

def blocked(*args, **kwargs):
    raise RuntimeError('Network access is disabled in the regression suite; mock the provider.')

socket.create_connection = blocked
socket.socket.connect = blocked
socket.socket.connect_ex = blocked
from django.core.management import execute_from_command_line
execute_from_command_line(['manage.py', 'test', '--noinput', *sys.argv[1:]])

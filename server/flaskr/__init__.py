#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2020 theo <theo@behemoth>
#
# Distributed under terms of the MIT license.

"""
Init file (creates app and database)
"""

import os
from flask import Flask
import click
from flask.cli import with_appcontext
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import logging
from logging.handlers import RotatingFileHandler
import sys

from dotenv import load_dotenv

from .config import config

load_dotenv()
db = SQLAlchemy()

def create_app(environment='development'):
    
    environment = os.environ.get('APP_ENVIRONMENT', environment)

    # Initial app and configuration
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config[environment])

    CORS(app, resources={r'/*' : {'origins' : '*'}})
    
    # Logging
    file_handler = RotatingFileHandler('api.log', maxBytes=10000, backupCount=1)
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    stdout = logging.StreamHandler(sys.stdout)
    stdout.setLevel(logging.DEBUG)
    app.logger.addHandler(stdout)

    db.init_app(app)
    
    #  db_url = os.environ.get("DATABASE_URL")
    #
    #  app.config.from_mapping(
    #          SECRET_KEY='dev',
    #          SQLALCHEMY_TRACK_MODIFICATIONS = False,
    #          SQLALCHEMY_DATABASE_URI = db_url,
    #          DEBUG=True
    #  )

    app.cli.add_command(init_db_command)

    from flaskr import nscope, auth

    app.register_blueprint(nscope.bp)
    app.register_blueprint(auth.bp)

    return app


def init_db():
    db.drop_all()
    db.create_all()

@click.command("init-db")
@with_appcontext
def init_db_command():
    init_db()
    click.echo("Initialized Database")


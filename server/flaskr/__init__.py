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
from flask_sqlalchemy import SQLAlchemy

from dotenv import load_dotenv

load_dotenv()
db = SQLAlchemy()

def create_app(test_config = None):

    app = Flask(__name__, instance_relative_config=True)

    db_url = os.environ.get("DATABASE_URL")

    app.config.from_mapping(
            SECRET_KEY='dev',
            SQLALCHEMY_TRACK_MODIFICATIONS = False,
            SQLALCHEMY_DATABASE_URI = db_url,
            DEBUG=True
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    db.init_app(app)
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


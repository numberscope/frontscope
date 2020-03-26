#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2020 theo <theo@behemoth>
#
# Distributed under terms of the MIT license.

"""
Config for flask app
"""

import os
from dotenv import load_dotenv
load_dotenv()


POSTGRES = {
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'pw': os.getenv('POSTGRES_PASSWORD', 'root'),
    'db': os.getenv('POSTGRES_DB', 'postgres'),
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': os.getenv('POSTGRES_PORT', 5432),
}

TEST_POSTGRES = {
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'pw': os.getenv('POSTGRES_PASSWORD', 'root'),
    'db': os.getenv('POSTGRES_DB', 'postgres'),
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': os.getenv('POSTGRES_PORT', 5432),
}


class Config:
    ERROR_404_HELP = False

    SECRET_KEY = os.getenv('APP_SECRET', 'secret key')

    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://{user}:{pw}@{host}:{port}/{db}'.format(**POSTGRES)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    DOC_USERNAME = 'api'
    DOC_PASSWORD = 'password'


class DevConfig(Config):
    DEBUG = True


class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://{user}:{pw}@{host}:{port}/{db}'.format(**TEST_POSTGRES)
    TESTING = True
    DEBUG = True


class ProdConfig(Config):
    DEBUG = False


config = {
    'development': DevConfig,
    'testing': TestConfig,
    'production': ProdConfig
}

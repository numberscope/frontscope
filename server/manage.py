#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2020 theo <theo@behemoth>
#
# Distributed under terms of the MIT license.

"""
Manages Resources and runs server / database
"""

import os

from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand

from flaskr import create_app, db

app = create_app()

migrate = Migrate(app, db)
manager = Manager(app)

manager.add_command('db', MigrateCommand)

if __name__ == '__main__':
    manager.run()


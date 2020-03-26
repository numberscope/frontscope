#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2020 theo <theo@behemoth>
#
# Distributed under terms of the MIT license.

"""
Views for nscope model
"""

from flask import Blueprint
from flask import flash
from flask import g
from flask import redirect
from flask import url_for
from flask import Flask, request, jsonify, render_template, send_file
from flask_login import LoginManager, current_user, login_user
from werkzeug.exceptions import abort
from sqlalchemy import or_, func

from flaskr import db
from flaskr.auth.views import login_required
#  from flaskr.nscop.models import *

bp = Blueprint("nscope", __name__)

@bp.route("/index")
def index():
    return render_template("index.html")

@bp.route("/api/vuetest", methods=["GET"])
def vuetest():
    return jsonify({"Answer" : "This is a test", "Data" : [4.5123, 4.123, 9.123, 1.12309]})

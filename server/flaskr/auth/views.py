#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2020 theo <theo@behemoth>
#
# Distributed under terms of the MIT license.

"""
Views for authentication prefixes
"""

import functools

from flask import Blueprint
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import url_for

from flaskr import db
from flaskr.auth.models import User

bp = Blueprint("auth", __name__, url_prefix="/auth")


def login_required(view):
    """View decorator that redirects anonymous users to the login page."""

    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for("auth.login"))

        return view(**kwargs)

    return wrapped_view


@bp.before_app_request
def load_logged_in_user():
    """If a user id is stored in the session, load the user object from
    the database into ``g.user``."""
    user_id = session.get("user_id")
    g.user = User.query.get(user_id) if user_id is not None else None


@bp.route("/register", methods=("GET", "POST"))
def register():
    """Register a new user.
    Validates that the email is not already taken. Hashes the
    password for security.
    """
    if request.method == "POST":
        email = request.form["email"]
        first_name = request.form["first_name"]
        last_name = request.form["last_name"]
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]

        error = None

        if not first_name or not last_name:
            error = "Name is required"
        elif not email:
            error = "Email is required."
        elif not password:
            error = "Password is required."
        elif password != confirm_password:
            error = "Passwords do not match"
        elif db.session.query(
            User.query.filter_by(email=email).exists()).scalar():
            error = "Email is already registered."

        if error is None:
            print("SUccess")
            # the name is available, create the user and go to the login page
            db.session.add(User(first_name=first_name, last_name=last_name, email=email, password=password))
            db.session.commit()
            return redirect(url_for("auth.login"))

        print("Error")
        flash(error)

    return render_template("register.html")


@bp.route("/login", methods=("GET", "POST"))
def login():
    """Log in a registered user by adding the user id to the session."""
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        error = None
        user = User.query.filter_by(email=email).first()

        if user is None:
            error = "Incorrect email."
        elif not user.check_password(password):
            error = "Incorrect password."

        if error is None:
            # store the user id in a new session and return to the index
            session.clear()
            session["user_id"] = user.id
            return redirect(url_for("nscope.index"))

        flash(error)

    return render_template("login.html")


@bp.route("/logout")
def logout():
    """Clear the current session, including the stored user id."""
    session.clear()
    return redirect(url_for("nscope.index"))

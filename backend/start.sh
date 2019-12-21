#!/usr/bin/env bash
a=$(lsof -t -i:8001) && kill -9 $a && python3 manage.py runserver 0.0.0.0:8001 &
# python3 manage.py process_tasks
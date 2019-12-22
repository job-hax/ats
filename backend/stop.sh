#!/usr/bin/env bash
a=$(lsof -t -i:8001) && kill -9 $a 
# python3 manage.py process_tasks

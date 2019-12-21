a=$(lsof -t -i:8081) && kill -9 $a && yarn build &

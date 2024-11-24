### Запуск контейнера с базой

`docker run --name deluxspa-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=*** -d mysql:latest`
`DB_URL=mysql://root:deloreon@127.0.0.1:3306/common npx prisma migrate dev --schema ./src/modules/db/schema.prisma`


### Карта
https://geojson.io/
https://yandex.ru/map-constructor/
cd backend

cp .env.example .env  # (create using values above)

docker compose -f docker-compose.dev.yml up --build

# in a second terminal (only first time)
docker exec -it $(docker ps -qf "name=api") npx prisma migrate dev --name init

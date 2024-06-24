FROM golang:1

COPY src ./src
COPY go.* .

RUN go mod download

CMD [ "go", "run" "src/main.go" ]
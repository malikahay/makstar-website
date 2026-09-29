FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /makstar-api ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /makstar-api /makstar-api
EXPOSE 8080
ENTRYPOINT ["/makstar-api"]

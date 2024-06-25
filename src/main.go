package main

import (
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type client struct {
	isClosing bool
	mu        sync.Mutex
}

var (
	clients      = make(map[*websocket.Conn]*client)
	clientsMutex sync.Mutex
	chatHistory  string
)

func main() {
	app := fiber.New()

	clientsMutex.Lock()
	chatHistory = "[]"
	clientsMutex.Unlock()

	// Upgraded websocket request
	app.Get("/chatter", websocket.New(func(c *websocket.Conn) {

		defer func() {
			clientsMutex.Lock()
			delete(clients, c)
			if len(clients) == 0 {
				chatHistory = ""
			}
			clientsMutex.Unlock()
			c.Close()
		}()

		c.WriteMessage(websocket.TextMessage, []byte(chatHistory))

		clientsMutex.Lock()
		clients[c] = &client{}
		clientsMutex.Unlock()

		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				break
			}
			clientsMutex.Lock()
			if len(msg) > len(chatHistory) {
				chatHistory = string(msg)
				for connection, c := range clients {
					go func(connection *websocket.Conn, c *client) {
						c.mu.Lock()
						defer c.mu.Unlock()
						if c.isClosing {
							return
						}
						if err := connection.WriteMessage(websocket.TextMessage, []byte(chatHistory)); err != nil {
							c.isClosing = true
							log.Println("A socket write failed... Closing the connection")
							connection.Close()
							delete(clients, connection)
						}
					}(connection, c)
				}
			}
			clientsMutex.Unlock()
		}
	}))

	// ws://localhost:3000/ws
	log.Fatal(app.Listen(":3001"))
}

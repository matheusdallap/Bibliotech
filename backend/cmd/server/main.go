package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	router.GET("/favicon.ico", func(c *gin.Context) {
		c.File("./frontend/static/img/favicon.ico")
	})
	router.Run() // listen and serve on 0.0.0.0:8080
}

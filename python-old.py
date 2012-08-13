#!/usr/bin/python
import socket
import sys
from optparse import OptionParser

class EchoServer(object):

    def __init__(self, options):
        self.host = options.host
        self.port = options.port
        self.backlog = 5
        self.size = 1024
        self.sock = None
        if options.verbose == True:
            print("Host: %s" % self.host)
            print("Port: %s" % self.port)

    def run(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.bind((self.host, self.port))
        self.sock.listen(self.backlog)

        while True:
            client, address = self.sock.accept()
            data = client.recv(self.size)
            data = str(data).rstrip() # removes newline
            if data:
                response = "Client said, \"%s\"" % data
                client.send(response)
            client.close()

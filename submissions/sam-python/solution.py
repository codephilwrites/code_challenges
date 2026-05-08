for i in range(1, 101):
    s = ("Ping" if i % 3 == 0 else "") + ("Pong" if i % 5 == 0 else "")
    print(s or i)

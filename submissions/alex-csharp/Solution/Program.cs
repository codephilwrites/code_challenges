for (int i = 1; i <= 100; i++)
{
    var s = "";

    if (i % 3 == 0)
        s += "Ping";

    if (i % 5 == 0)
        s += "Pong";

    Console.WriteLine(string.IsNullOrEmpty(s) ? i.ToString() : s);
}

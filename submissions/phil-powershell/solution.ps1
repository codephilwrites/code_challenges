1..100 | ForEach-Object {
    $s = ""

    if ($_ % 3 -eq 0) {
        $s += "Ping"
    }

    if ($_ % 5 -eq 0) {
        $s += "Pong"
    }

    if ($s) {
        [Console]::WriteLine($s)
    } else {
        [Console]::WriteLine($_)
    }
}

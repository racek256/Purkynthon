#!/usr/bin/env python3
"""Script to add the specific users from the table to the database."""

import sqlite3

DB_FILE = "db.db"

# Users from the provided table
USERS_TO_ADD = [
    {
        "username": "mate.mitr",
        "password": "tke9jEwg",
        "pass_bcrypt": "$2b$12$nmfjZ0ZdQdf8F.3P9xD8ie2af6otvci2sCzSYZYrwYpjEvHpfvmXS",
    },
    {
        "username": "jan.kupc",
        "password": "EybC2vtc",
        "pass_bcrypt": "$2b$12$a//utWsT5xn8fIDl/5cNsu474DlLX80keahes4r6jhWxldtcQkZ6K",
    },
    {
        "username": "jaku.mrkv",
        "password": "2KntrZGK",
        "pass_bcrypt": "$2b$12$wRJzj5NRfK3VctNbEPw8TuLVeasglacpQ.jL8FR.qda0.iXLhr.fa",
    },
    {
        "username": "adam.baye",
        "password": "gbU7vWK6",
        "pass_bcrypt": "$2b$12$Gj3qDmHPj5cT5vDKotYX8.7QYg8TV9dlmPlGNTCdfMKLPCDBTpUtq",
    },
    {
        "username": "maty.pavl",
        "password": "WVgTixGa",
        "pass_bcrypt": "$2b$12$XNSri2PGVheE53FQ59A1g.H2/uaC72dLPnw.JghZcy70bEdWz33Xu",
    },
    {
        "username": "seba.hofb",
        "password": "FikkXUuU",
        "pass_bcrypt": "$2b$12$GiS2gp4uzWrxaYrImU35qufD6I3s0Fm.cbnci42U9VEncdt/9Inza",
    },
    {
        "username": "miro.prud",
        "password": "nuKf9ZOj",
        "pass_bcrypt": "$2b$12$at3fr0fan2M0j6xItzUWbeJBRq16gm74KW1d2RZwQKF4ywCKzcTzG",
    },
    {
        "username": "robi.cach",
        "password": "SukZbFyr",
        "pass_bcrypt": "$2b$12$/GFx6L0sVbq2iOoArDJPMO9IAxm4f5DpBZqAfQyHk.O5akJ7DVjiC",
    },
    {
        "username": "samu.lank",
        "password": "A8eaka6v",
        "pass_bcrypt": "$2b$12$gaGQcvWFcE0UO7594M370eeCKKFGj6hQasSFS0kpeZxpHFJdODFZK",
    },
    {
        "username": "samu.puce",
        "password": "tAC8eSCv",
        "pass_bcrypt": "$2b$12$xLKhktk8HjnWUIjPYAsGmOlnXHsKh6rvOosxT0frCmNGUls1P3QY6",
    },
    {
        "username": "jaku.prch",
        "password": "yfpxOixJ",
        "pass_bcrypt": "$2b$12$mPib/Agzgq3NGqNp5Y75XO4jErZTMFwR1V/EQqUSqgQhc9i/RSzkW",
    },
    {
        "username": "olek.kuku",
        "password": "0AutbU8L",
        "pass_bcrypt": "$2b$12$4FAx3iX6mO0Mxw9et5IqXOP6lbpNT5vsfBaUjflkL0r2TK8MBmv1C",
    },
    {
        "username": "toma.kara",
        "password": "xzlIZink",
        "pass_bcrypt": "$2b$12$eD6Qt1N/MYRWZ0vWbe4Bd.rd035lz4DwMda3hU7Q6rPq/UphYzOP6",
    },
    {
        "username": "vrat.dane",
        "password": "x0S0522B",
        "pass_bcrypt": "$2b$12$oUTnPINgDxsQtDGbG8vGEuGWPIyCYgMfS.M5YlnKH/3yULHjTZMjG",
    },
    {
        "username": "mich.tuma",
        "password": "wnb2C8rW",
        "pass_bcrypt": "$2b$12$LfAZRG5skIs54HfM4mD.s.u/qfVpYPhkS3q/5YvNkXwqmi/9HFlaO",
    },
    {
        "username": "zden.olsa",
        "password": "nLcS8hul",
        "pass_bcrypt": "$2b$12$6OfjwidyR7/NfL0T/p0Z7u8XP2kP0OfV0vrIOXUmpzbFy6hGo52UC",
    },
    {
        "username": "magd.kozd",
        "password": "GZ0kUk2t",
        "pass_bcrypt": "$2b$12$Nm/FM3jZU1jT4reznYPsbO9XYXpIPuoRFyzid9cut1nVcADmb0ik6",
    },
    {
        "username": "miku.most",
        "password": "OugQjufW",
        "pass_bcrypt": "$2b$12$Y4bL4hzYfklVHOu7L09/WOhmCIw1E39UmQKrnV2Z/ZNNdPSpkqAH6",
    },
    {
        "username": "krys.knot",
        "password": "SahWweDW",
        "pass_bcrypt": "$2b$12$rncg.912sIxwXHKFP10QKePcrYPpo0sbsIcrAceiXkkMVv.0cylUu",
    },
    {
        "username": "adam.slun",
        "password": "rQNbfZZO",
        "pass_bcrypt": "$2b$12$DfaKz8LDclhau8kqk78R4uGRUe30n/BHBX2gw.tt0UM.5UWwFMWBi",
    },
    {
        "username": "samu.puce1",
        "password": "fL4do7tY",
        "pass_bcrypt": "$2b$12$WgobcYeC/YlYpNHl1KahAeAQbjySWwKZuRS67.QqZqmZcQXN1T1Pu",
    },
    {
        "username": "simo.kubi",
        "password": "1qc2mrhf",
        "pass_bcrypt": "$2b$12$OFoUkevAGl10f2LzCM739eALMZdLyaZfnU8Jc/OXZ/dXbHYbSfwPm",
    },
    {
        "username": "mare.sedl",
        "password": "1ayAU0iu",
        "pass_bcrypt": "$2b$12$rlKFFQOqFUSHQnXA/qLJZeD3c.3Z/vQlUunBhdBuTiB1YAyHUT5/i",
    },
    {
        "username": "mich.sipk",
        "password": "qS4ZJ9D2",
        "pass_bcrypt": "$2b$12$l0TEd0X3P4R6Dm3n4Zr.z.ii4DPrprujNGPEVJkfarPAds6Tj5DfW",
    },
    {
        "username": "adam.mikl",
        "password": "c1twDlag",
        "pass_bcrypt": "$2b$12$ysD4DUkuh5jhHKZSlDiZau4wawNtZiuMiu.FP5vqDAECNU/vh3E2q",
    },
    {
        "username": "samu.sedl",
        "password": "lWamZuc2",
        "pass_bcrypt": "$2b$12$dwcDfNYxkh9t2QvDUxZdpuNMlR8NS0MNOPYtyfhCMK7vkw.cX3s7u",
    },
    {
        "username": "mila.oplu",
        "password": "oGM00IlQ",
        "pass_bcrypt": "$2b$12$edihj39zIlkwKQIZNB1yMOmN52Z4PkhxC2G8PWNHxUEHLj1mio9xe",
    },
    {
        "username": "toma.semo",
        "password": "qrq3v7Ea",
        "pass_bcrypt": "$2b$12$hqEnyRDuaJ0UXAh0/Wo9eePMjP.ek/8BOrVfZC7Kz/ELG2cx3rU7e",
    },
    {
        "username": "ondr.kost",
        "password": "hb8ZM2Ka",
        "pass_bcrypt": "$2b$12$qVBEPRGriHR5V5wspApObefnNWdsSb5wOR0dXKPek4OKVkx8uiH9e",
    },
    {
        "username": "jaku.kize",
        "password": "0xx5Ij0U",
        "pass_bcrypt": "$2b$12$VbmtzSpj.ugLu83eW88FUO2znduV9sFwiGxswLXtgjR33mH6n/MV6",
    },
    {
        "username": "mich.bart",
        "password": "kS30inQe",
        "pass_bcrypt": "$2b$12$JPthEOCYcxZtL.o3j.FtsukLYTt7u8wC.ctw7r4lmRhL.UD/0OxOK",
    },
    {
        "username": "mart.gajd",
        "password": "6kNaWVco",
        "pass_bcrypt": "$2b$12$4goRbL/VvyyMaUxHi6jFMelIBaKfIh1bJe9GB1MAzZG765j5MZPG2",
    },
    {
        "username": "jaku.reic",
        "password": "341z1PZM",
        "pass_bcrypt": "$2b$12$ot6l4ZPVTgj9LnHvoSZeQOfykIVqy1o.UC1nsteG/6McUR6nkdpsO",
    },
    {
        "username": "patr.cvrk",
        "password": "ve50G2vW",
        "pass_bcrypt": "$2b$12$zuO4eZOq4De75H4EPzZxWupyAJQyedWOiIw8kVJqjfY2zvfmYUViG",
    },
    {
        "username": "jaku.mrkv1",
        "password": "cYqXrdMX",
        "pass_bcrypt": "$2b$12$VrI/s7K1806bihNhLZSXs.yh.ogMyrtj0xxWWCo9qOXHRuzl4chB2",
    },
    {
        "username": "rade.pave",
        "password": "nKpfEyzD",
        "pass_bcrypt": "$2b$12$IaMkR9U5.8nSIRM3ha5ceO6.JJO/XS9C0FflYoznTil9TGRIrFk7.",
    },
    {
        "username": "tobi.lore",
        "password": "SCMDUlRr",
        "pass_bcrypt": "$2b$12$ksRLNYfidgq6YDZWZw7Th.tz5Yx55puRGBbS9pEV7f6ydAnqaDx6a",
    },
    {
        "username": "jan.kali",
        "password": "fiAWeIuo",
        "pass_bcrypt": "$2b$12$oWGFeIxnAKlcXhd/SRKBzugUVOSMIbs6edRkVjrgvgnqn/M4yxIgq",
    },
    {
        "username": "tobi.haje",
        "password": "qfldJ9Ow",
        "pass_bcrypt": "$2b$12$0v.RF0.gEf8abwfOBB/up.Fbzw5jmCbDqIqn4KExiUpbxA0A8jYpq",
    },
    {
        "username": "jaku.troc",
        "password": "MaHkUNM3",
        "pass_bcrypt": "$2b$12$N4.fIhk95cTv6M4aT/QR7Oqcjsavr0CMSqRkBKWhw7iDIO2ZuzkwC",
    },
    {
        "username": "ondr.ande",
        "password": "hvBsqbEd",
        "pass_bcrypt": "$2b$12$ngmWZH/zKiXN5y.xr.aTg.roOnEDsdBp6pMWbBFtgztjUaOwr/PiS",
    },
    {
        "username": "nela.mach",
        "password": "ZDn8W7V3",
        "pass_bcrypt": "$2b$12$TFzVr3GcXyN3011gnryBieVflY7RhKA18NHtHVxHX0KtYkIXaBIAa",
    },
    {
        "username": "toma.kara1",
        "password": "Ofwxup6U",
        "pass_bcrypt": "$2b$12$ytMdtHQek.STsa/8BvTvceLpPPOCUbdh24ePLukfJy9kXr7SWjK4a",
    },
    {
        "username": "dani.bart",
        "password": "A3uBHAWp",
        "pass_bcrypt": "$2b$12$CQeagQ/K7khJeyMxdsbQzeZQLHPMyN6bdQg1Yb6/5IBbGJapm53Ya",
    },
    {
        "username": "mart.flor",
        "password": "OkVjivBD",
        "pass_bcrypt": "$2b$12$WjnxUirr/3TkOP6fNaXseuNuL9w/gBVxM6e8cJsRPTkFlzta1rJ4e",
    },
    {
        "username": "brig.kocm",
        "password": "kBG52rLV",
        "pass_bcrypt": "$2b$12$0aB2FDN40MMd0b.kSWLA5OS/1Oqfn8UDTypIsec2wkL7Uqs.9b2QG",
    },
    {
        "username": "eva.riho",
        "password": "MGpHS5X5",
        "pass_bcrypt": "$2b$12$TetVOaNw4pUBnsPO82MWJ.BPn0poENmZdTNSxcKLue6v2oF8mCadW",
    },
    {
        "username": "nahradnik1",
        "password": "IiSDaCw5",
        "pass_bcrypt": "$2b$12$YlFhhaSW9wAj6ZtmRLa1Ee8LQDQi..AVKiUBpu.c4F.Re7KMk9/3a",
    },
    {
        "username": "nahradnik2",
        "password": "wp0MamkC",
        "pass_bcrypt": "$2b$12$xeo4iqsscEt7lmuEe3QkP.RlpKg7QKhz5vOtYEDtNrbXUd.rFnN3e",
    },
    {
        "username": "nahradnik3",
        "password": "jYs8U92K",
        "pass_bcrypt": "$2b$12$kVyc4it.R0Y3swfjjh.aJ.Fbg474gXCETt3ji3F925qPmuTS55A.6",
    },
    {
        "username": "nahradnik4",
        "password": "Tc8Rlod2",
        "pass_bcrypt": "$2b$12$5hr5v2ew121Z5S0z2MOKh.pp6Va4CqXC/QOwxq54BaveYrZhqu7.G",
    },
    {
        "username": "nahradnik5",
        "password": "ok1U3ThU",
        "pass_bcrypt": "$2b$12$Ag9kcE1X6Skmx0oKjkckeuRfgM6kw8FA2ncgF7uoJBs/LwPMi0cJ.",
    },
    {
        "username": "nahradnik6",
        "password": "FleEA0R0",
        "pass_bcrypt": "$2b$12$aXIkpRhrDYXIDeG7uZz4VOchoVMuw3rFj6p3SHbm0GFVx4oxItdba",
    },
    {
        "username": "nahradnik7",
        "password": "AdjhUxGU",
        "pass_bcrypt": "$2b$12$Vh1PzBk1uLwgxIlOJThDje.wBQKDmmgYA9DBXxs3HnuemZAEyM5wG",
    },
    {
        "username": "nahradnik8",
        "password": "laTRzLfi",
        "pass_bcrypt": "$2b$12$kDNsWEF1ravoVdirTrwXwu7.DLkdB6OMXLpLmpyugeF7wEggRX/NG",
    },
]


def add_users():
    """Add all users from the table to the database."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE username=?", ("admin",))
    admin_row = cur.fetchone()
    admin_id = admin_row[0] if admin_row else None
    if admin_id is None:
        cur.execute("DELETE FROM finished_lessons")
        cur.execute("DELETE FROM users")
    else:
        cur.execute("DELETE FROM finished_lessons WHERE user_id != ?", (admin_id,))
        cur.execute("DELETE FROM users WHERE username != ?", ("admin",))

    added = 0
    skipped = 0

    for user in USERS_TO_ADD:
        try:
            cur.execute(
                "INSERT INTO users (username, password, score, level) VALUES (?, ?, ?, ?)",
                (user["username"], user["pass_bcrypt"], 0, 0),  # Start with score=0, level=0
            )
            added += 1
            print(f"Added user: {user['username']}")
        except sqlite3.IntegrityError:
            skipped += 1
            print(f"Skipped user (already exists): {user['username']}")

    conn.commit()
    conn.close()

    print(f"\nDone! Added: {added}, Skipped: {skipped}")


def list_users():
    """List all users in the database."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT id, username, score, level FROM users ORDER BY id")
    users = cur.fetchall()
    conn.close()

    print("\n=== All Users in Database ===")
    print(f"{'ID':<4} {'Username':<20} {'Score':<8} {'Level':<6}")
    print("-" * 42)
    for user in users:
        print(f"{user[0]:<4} {user[1]:<20} {user[2]:<8} {user[3]:<6}")


if __name__ == "__main__":
    print("=== Adding Users from Table ===\n")
    add_users()
    list_users()

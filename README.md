# Judgement Bingo

Quick simple web app I am putting together for a family holiday. It bingo cards where the dumb stuff we do are squares.
The interesting part of it is that the prompts are encrypted and shared with everyone except the subject of the prompt.
So not even I, the owner of the app, can see what my siblings have put for my behaviour.

# Game Description

Users submit prompts such as "Dad comments on someone's weight", or "James rambles for longer than 3 minutes on a topic
nobody else cares about", noting a specific **subject** of the prompt. Submitted prompts become available for review and
approval by other players in the game. All approved prompts are added to the Prompt Bank. If the subject is a person
participating in the game, they will see that a prompt about themselves has been submitted, but not what the prompt
itself is.

Once enough prompts have been added to the Prompt Bank, players can then construct their bingo cards using the prompts
in the bank. All prompts can be used by any player, and players can see each-other's bingo cards, but will still not be
able to view the content of the prompts that are about them.

Once the game starts, players can submit confirmation that an event for a corresponding prompt occurred, and will mark
off that bingo square for all players. When a prompt is considered completed, it will become visible to the subject.

# Architecture

The project consists of 3 main components

- SpringBoot API
- React Frontend
- Postgres Database

Given that the intended user base is "my family & friends", cost is one of the biggest considerations. For that reason,
the Frontend is bundled with the API container and served together. I still haven't decided if I use a tiny RDS instance
or a containerized Postgres instance when I got to the cloud...

# Encryption using Logical Key Hierarchy

None of my family are particularly nerdy when it comes to CS, but I am take this seriously for the fun of it.

As a participant in the game, I should not have visibility to the prompts that are about me. But as the server owner, I
will have access to the Database where the prompts are stored. A standard scenario where a client can't trust the server
with visibility to its data. The solution is encryption.

But the encryption is not point-to-point, or a simple RSA public-private key encryption. The ticky part is that all
users can see the message **except** for the subject of the message. I could just generate encryption pairs for all the
relationships (O(n^n); there's not that many people involved) but let's pretend this is too big for brute force and
look for a more elegant and scalable solution to the problem. Broadcast encryptions have this kind of exclusionary
systems baked in, so it's a great technology for this type of problem.

Logical Key Hierarchy (LKH) is one suitable example. Rather than worrying about the relationships between people,
everyone is sorted into a hierarchy, and stores the keys for all nodes between themselves and the root node. Encryption
then targets the nodes required to build the compliment of the individual. In the below example, to pick Bob as the
excluded subject, the targeted keys would be K_Alice, K_LR, and K_R.

```mermaid
graph TD
    K_root["K_root"]
    
    K_L["K_L"]
    K_R["K_R"]
    
    K_root --> K_L
    K_root --> K_R

    K_LL["K_LL"]
    K_LR["K_LR"]
    K_RL["K_RL"]
    K_RR["K_RR"]

    K_L --> K_LL
    K_L --> K_LR
    K_R --> K_RL
    K_R --> K_RR

    Alice["Alice"]
    Bob["Bob"]
    Charlie["Charlie"]
    Dana["Dana"]
    Erica["Erica"]
    Frank["Frank"]
    George["George"]

    K_LL --> Alice
    K_LL --> Bob

    K_LR --> Charlie
    K_LR --> Dana

    K_RL --> Erica
    K_RL --> Frank

    K_RR --> George


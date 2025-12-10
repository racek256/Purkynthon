from typing import Tuple


def start_and_ends_with_quotes(text: str) -> bool:
    if (text.startswith("'") or text.startswith('"')) and (text.endswith("'") or text.endswith('"')):  # long ahh if statement
        return True

    return False

def check_code_sanitization(input: str) -> Tuple[str, bool, int]:
    """Checks if the code is safe to execute and returns a Tuple[str, bool, int],
       where str is the problem, bool is whether the code succesfuly passed the check,
       and int is the line number of where the problem occurs."""
    for line_num, line in enumerate(input.split("\n")):
        for word in line.split():
            if not start_and_ends_with_quotes(word) and word.strip() == "import":
                return ("import (importing libraries is not allowed)", False, line_num)
    return ("", True, 0)


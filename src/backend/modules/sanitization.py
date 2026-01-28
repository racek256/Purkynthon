from typing import Tuple, List
from modules.standard_stuff import get_return_statement_sub, get_allowed_modules


def replace_final_return(text: str, replacement: str) -> str:
    lines = text.split("\n")

    last_idx = None
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() != "":
            last_idx = i
            break

    if last_idx is None:
        return text

    line = lines[last_idx]

    if line.startswith("return") and not line.startswith((" ", "\t")):
        rest = line[len("return"):]
        lines[last_idx] = replacement + rest

    return "\n".join(lines)

def replace_all_returns(text: str, replacement: str) -> str:
    lines = text.split("\n")
    replaced_lines: List[str] = []
    for line in lines:
        if line.strip().startswith("return"):
            replaced_lines.append(line.replace("return", replacement))
        else:
            replaced_lines.append(line)

    return "\n".join(replaced_lines)


def start_and_ends_with_quotes(text: str) -> bool:
    if (text.startswith("'") or text.startswith('"')) and (text.endswith("'") or text.endswith('"')):  # long ahh if statement
        return True

    return False


def check_code_validity(input: str) -> Tuple[str, bool, int]:
    """Checks if the code is safe to execute and returns a Tuple[str, bool, int],
       where str is the problem, bool is whether the code succesfuly passed the check,
       and int is the line number of where the problem occurs."""
    
    # if not input.split("\n")[0].startswith("def"):
    #     return ("All code must be wrapped in a function.", False, 0) 

    for line_num, line in enumerate(input.split("\n")):
        if get_return_statement_sub() in line:
            return (f"{get_return_statement_sub()} can't be used in your code, since it conflicts with internal processes.", False, line_num)

        parts = line.split()
        if len(parts) > 1 and parts[1] not in get_allowed_modules():        
            for word in parts:
                if not start_and_ends_with_quotes(word) and word.strip() == "import":
                    return ("import (importing this library isn't allowed)", False, line_num)
    return ("", True, 0)



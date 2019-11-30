#!/usr/bin/python3
import importlib
import argparse

parser = argparse.ArgumentParser(description='Run AOC day')
parser.add_argument('day', metavar='Day', type=int, help='the day to run')
parser.add_argument('year', metavar='Year', type=int, nargs='?', default=2019, help='the year to run')
parser.add_argument('--part2', dest='part2', action='store_true', default=False, help='run part 2 of puzzle')
args = parser.parse_args()

yearFolder = str(args.year)
dayFolder = str(args.day).rjust(2, '0')
folder = f'{yearFolder}/{dayFolder}/'

spec = importlib.util.spec_from_file_location("code", f'{folder}/code.py')
code = importlib.util.module_from_spec(spec)

print(f'Running day {dayFolder} of {yearFolder}')
spec.loader.exec_module(code)
code.run(folder = folder, runPart2 = args.part2)
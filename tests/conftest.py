import os
import sys

# Agrega api/ a sys.path para importar _core en los tests.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "api"))

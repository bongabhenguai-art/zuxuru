import json
import unittest
from pathlib import Path
from datetime import date, timedelta
from omni_router import daily_tasks, route_module

class OmniRouterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.registry=json.loads((Path(__file__).parent/'data/omni-modules.json').read_text())

    def test_week_covers_every_module_without_overloading_a_day(self):
        seen=set()
        for i in range(7):
            tasks=daily_tasks((date(2026,10,5)+timedelta(days=i)).isoformat(),self.registry)
            self.assertEqual(len(tasks),3)
            self.assertEqual(tasks[0]['module'],'sales')
            self.assertTrue(all(not task['done'] for task in tasks))
            self.assertTrue(all(task['instruction_path'].startswith('jarvis/modules/') for task in tasks))
            seen.update(task['module'] for task in tasks)
        self.assertEqual(seen,{m['id'] for m in self.registry['modules']})

    def test_routing_is_inspectable_and_has_a_defined_fallback(self):
        self.assertEqual(route_module('Improve my brand bio and logo',self.registry['modules']),'branding')
        self.assertEqual(route_module('Improve SEO search visibility',self.registry['modules']),'visibility_seo')
        self.assertEqual(route_module('A personal next step',self.registry['modules']),'career')

    def test_dates_are_validated(self):
        with self.assertRaises(ValueError):
            daily_tasks('not-a-date',self.registry)

if __name__ == '__main__':
    unittest.main()

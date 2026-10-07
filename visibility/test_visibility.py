import unittest
from normalize_maps import normalize
from backlinks import Links
class VisibilityTests(unittest.TestCase):
    def test_source_and_dedup(self):
        rows=normalize([{'title':'Test boutique','link':'https://maps.google.com/?cid=1','website':'javascript:invalid'},{'title':'Duplicate','link':'https://maps.google.com/?cid=1'},{'title':'No proof'}]);self.assertEqual(len(rows),1);self.assertEqual(rows[0]['website'],'');self.assertEqual(rows[0]['status'],'unreviewed')
    def test_backlink_anchor(self):
        p=Links('https://source.example/page','https://brand.example/');p.feed('<p>https://brand.example/</p><a href="https://brand.example.evil/">wrong</a><a href="https://brand.example/" rel="nofollow sponsored">yes</a>');self.assertEqual(len(p.matches),1);self.assertEqual(p.matches[0]['rel'],'nofollow sponsored')
    def test_limits(self):self.assertEqual(len(normalize([{'name':str(i),'link':f'https://maps.google.com/?cid={i}'} for i in range(50)])),25)
if __name__=='__main__':unittest.main()

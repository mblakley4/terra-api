function makePledgesArray() {
  return [
    {
      id: 1,
      name: 'Mike',
      location: 'Florida',
      days: 30,
      likes: 0
    },
    {
      id: 2,
      name: 'Marie',
      location: 'El Paso',
      days: 25,
      likes: 0
    },
    {
      id: 3,
      name: 'Hailey',
      location: 'Jacksonville',
      days: 25,
      likes: 0
    },
    {
      id: 4,
      name: 'Alyssa',
      location: 'Alaska',
      days: 21,
      likes: 0
    },
  ]
}

function makeMaliciousPledge() {
  const maliciousPledge = {
    id: 411,
    name: 'Weak Hack <script>alert("xss");</script>',
    location: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    days: 15,
    likes: 2
  }
  const expectedPledge = {
    id: 411,
    name: 'Weak Hack &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    location: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    days: 15,
    likes: 2
  }
  return {
    maliciousPledge,
    expectedPledge,
  }
}

module.exports = {
  makePledgesArray,
  makeMaliciousPledge,
}

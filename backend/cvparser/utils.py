import json
from collections import Counter


def top_skills_in(comp, data, top_number):
    comp = comp.lower()
    target = []
    for line in data:
        job = ' '.join(line["position"]).lower()
        if comp in job:
            target.append(line)

    skills = Counter()
    for line in target:
        skills.update(Counter(line["top_skills"]))
    return skills.most_common(top_number)


def common_attr(attr, data, top_number):
    attrs = Counter()
    for line in data:
        if isinstance(line[attr], list):
            attrs.update(Counter(line[attr]))
        else:
            attrs.update(Counter([line[attr]]))
    return attrs.most_common((top_number))

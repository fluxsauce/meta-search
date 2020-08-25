# meta-search

Search code and packages managed with [meta](https://github.com/mateodelnorte/meta).

## Usage

```bash
meta search
```

```
Usage: meta-search [options] [command]

Options:
  -h, --help      display help for command

Commands:
  package         Find packages in package.json that match given criteria
  help [command]  display help for command
```

```bash
meta search package
```

```
Usage: meta-search-package [options] <name>

package - Find packages in package.json that match given criteria

Arguments:
  name: Name of the package you are searching for

Options:
  -V, --version           output the version number
  -m, --minimum [semver]  Manually specify minimum semantic version. Ex: ">=1.16"
  -e, --excludeSatisfied  Exclude projects that satisfy semantic version
  -h, --help              display help for command
```

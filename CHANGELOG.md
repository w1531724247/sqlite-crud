## 2.1.0 (2018-01-01)
* Reorganized structure of promises 

## 2.0 (2016-09-08)
* Replaced `Q` with `new Promise()`

## 1.4 (2016-08-21)
* Run migration queries stepwise
* Added parameters to `DB.run()` and `DB.queryRows()`

## 1.3 (2016-06-11)
* Migration
* Verbose log

## 1.2 (2016-05-14)
Added `getRows()` method.

Renamed 4 methods:
* `insertToTable` -> `insertRow`
* `updateInTable` -> `updateRow`
* `getFromTable` -> `queryOneRow`
* `getAll` -> `queryRows`

<?php

const DATA_PATH = "data.csv";

$reqEndpoint = $_GET["endpoint"];
$reqData = $_GET["data"];

if (isset($reqEndpoint) && isset($reqData)) {
    $reqEndpoint = trim(urldecode($reqEndpoint), "/");
    $reqData = urldecode(base64_decode($reqData));
    if (substr_count($reqData, ",") > 0) {
        $arrData = explode(",", $reqData);
    }
    switch ($reqEndpoint) {
        case "get":
            getAllSaved();
            break;
        case "update":
            mealUpdate($arrData);
            break;
        case "archive":
            mealArchive();
            break;
    }
}

function getAllSaved() {
    print(file_get_contents(DATA_PATH));
}

function mealUpdate($data) {
    $csv = new CSV(DATA_PATH);
    $csv->putRecord(substr($data[0], 0, 1), substr($data[0], 2, 1), $data[1]);
    $csv->writeCsv();
}

function mealArchive() {
    $csv = new CSV(DATA_PATH);
    $csv->shiftRecords(3);
    $csv->insertRange(3, 7);
    $csv->writeCsv();
}

class CSV {
    public $path;
    public $data;

    public function __construct($path) {
        $this->path = $path;
        $this->data = array();

        $rawData = file_get_contents($path);
        $rawData = explode("\n", $rawData);
        $rowIdx = 0;
        foreach ($rawData as $line) {
            $colIdx = 0;
            $this->data[$rowIdx] = array();
            foreach (explode(",", $line) as $record) {
                $this->data[$rowIdx][$colIdx] = $record;
                $colIdx++;
            }
            $rowIdx++;
        }
    }

    public function putRecord($rowIdx, $colIdx, $value) {
        $this->data[$rowIdx][$colIdx] = $value;
    }

    public function insertRange($numRows, $numCols, $startRow = 0, $value = "") {
        for ($r = 0; $r < $numRows; $r++) {
            for ($c = 0; $c < $numCols; $c++) {
                $this->data[$startRow + $r][$c] = $value;
            }
        }
    }

    public function shiftRecords($numShiftRows) {
        for ($r = count($this->data) - 1; $r >= 0; $r--) {
            for ($c = count($this->data[$r]) - 1; $c >= 0; $c--) {
                $this->data[$r + $numShiftRows][$c] = $this->data[$r][$c];
            }
        }
    }

    public function writeCsv() {
        $writeData = "";
        foreach ($this->data as $line) {
            foreach ($line as $record) {
                $writeData .= $record . ",";
            }
            $writeData = substr($writeData, 0, -1) . "\n";
        }
        $writeData = substr($writeData, 0, -1);
        $file = fopen($this->path, "w+");
        fwrite($file, $writeData);
        fclose($file);
    }
}

function generateRandomString($length) {
	return substr(str_shuffle(str_repeat($x='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)))), 1, $length);
}
?>
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
        case "update":
            mealUpdate($arrData);
            break;
        case "get":
            getAllSaved();
            break;
    }
}

function mealUpdate($data) {
    $idx = (substr($data[0], 0, 1) * 7) + substr($data[0], 2, 1);
    $csv = loadCsv();
    $csv[$idx] = $data[1];
    overwriteCsv($csv);
}

function getAllSaved() {
    print(file_get_contents(DATA_PATH));
}

class CSV {
    public $path;
    public $data;

    public function __construct($path) {
        $this->path = $path;
        $rawData = file_get_contents($path);
        $rawData = $rawData.split("\n");
        for ($rawData as $line) {
            ($this->data)
        }
    }

    public function putRecord($data) {
        $this->
    }

    public function writeCsv() {
        $file = fopen($path);
        for ($line in $data.split)
    }
}

function generateRandomString($length) {
	return substr(str_shuffle(str_repeat($x='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' , ceil($length/strlen($x)) )),1,$length);
}
?>
<?php
	require_once('dbconnect.php');
	session_start();
	
	// check if user has been logged in first
	if (isset($_SESSION['user_id'])) {
		$table = $_REQUEST['table'];
		$query = 'SELECT * FROM ' . $table;
		
		// add any variables passed as conditionals to query
		if (count($_REQUEST) > 1) { 
			$query .= ' WHERE ';
			foreach ($_REQUEST as $key => $val) {
				if ($key !== 'table' && $key !== '_ga') {
					// if array is passed in, query if value is any of array values
					if (is_array($val)) {
						$query .= $key . ' IN ("' . implode('", "', $val) . '") AND ';
					} else {
						$query .= $key . ' = "' . $val . '" AND ';
					}
				}
			}
			$query = substr($query, 0, strlen($query) - 4); // strip last "AND "
		}
		
		// send query to database
		try {
			$statement = $dbh->prepare($query);
			$statement->execute();
			$result = $statement->fetchAll(PDO::FETCH_ASSOC);
			echo json_encode($result);
		} catch (PDOException $e) {
			echo json_encode(array('error' => $e->getMessage()));
		}
	} else {
		echo json_encode(array('error' => 'Please login before continuing.'));
	}
?>
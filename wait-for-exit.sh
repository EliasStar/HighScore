while ping -c 1 $1 &> /dev/null do
sleep 1;
done;

echo "$1 finished!"
exec $2
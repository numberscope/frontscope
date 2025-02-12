echo ---
if compare -version > /dev/null;
then
  echo "Comparing modified image: $1"
  compare $2 $1 png:- | montage -geometry +8+8 -tile 1x3 -title "old / diff / new" $2 - $1 png:- | display -title "$1" -
else
  diff $2 $1
fi

exit 0
